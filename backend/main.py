from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Job, Grader, Result
from schemas import (
    JobResponse,
    JobUpdateReference,
    GraderCreate,
    GraderResponse,
    ResultResponse,
)
from evaluators import evaluate_text_similarity

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Interview Grader API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== JOB ROUTES =====


@app.get("/jobs", response_model=list[JobResponse])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(Job).order_by(Job.created_at.asc()).all()


@app.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.put("/jobs/{job_id}/reference", response_model=JobResponse)
def update_job_reference(
    job_id: int, data: JobUpdateReference, db: Session = Depends(get_db)
):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.reference_output = data.reference_output
    db.commit()
    db.refresh(job)
    return job


# ===== GRADER ROUTES =====


@app.post("/graders", response_model=GraderResponse)
def create_grader(data: GraderCreate, db: Session = Depends(get_db)):
    grader = Grader(
        type=data.type,
        name=data.name,
        pass_threshold=data.pass_threshold,
        evaluation_metric=data.evaluation_metric,
    )
    db.add(grader)
    db.commit()
    db.refresh(grader)
    return grader


@app.get("/graders", response_model=list[GraderResponse])
def list_graders(db: Session = Depends(get_db)):
    return db.query(Grader).all()


@app.get("/graders/{grader_id}", response_model=GraderResponse)
def get_grader(grader_id: int, db: Session = Depends(get_db)):
    grader = db.get(Grader, grader_id)
    if not grader:
        raise HTTPException(status_code=404, detail="Grader not found")
    return grader


# ===== RESULT ROUTES =====


@app.get("/jobs/{job_id}/results", response_model=list[ResultResponse])
def get_job_results(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    results = db.query(Result).filter(Result.job_id == job_id).all()
    return results


# ===== EVALUATION ROUTE =====


@app.post("/graders/{grader_id}/run/{job_id}", response_model=ResultResponse)
def run_grader(
    grader_id: int, job_id: int, db: Session = Depends(get_db)
):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    grader = db.get(Grader, grader_id)
    if not grader:
        raise HTTPException(status_code=404, detail="Grader not found")

    if not job.reference_output:
        raise HTTPException(
            status_code=400,
            detail="Job does not have a reference answer set",
        )

    # Evaluate based on grader type
    if grader.type == "text_similarity":
        score = evaluate_text_similarity(
            job.model_output,
            job.reference_output,
            grader.evaluation_metric,
        )
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Grader type '{grader.type}' not yet implemented",
        )

    # Determine if evaluation passed
    passed = score >= grader.pass_threshold

    # Store result
    result = Result(
        job_id=job_id,
        grader_id=grader_id,
        score=score,
        passed=passed,
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    return result
