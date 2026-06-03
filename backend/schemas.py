from datetime import datetime

from pydantic import BaseModel, Field


class JobResponse(BaseModel):
    id: int
    title: str
    prompt: str
    model_output: str
    reference_output: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class JobUpdateReference(BaseModel):
    reference_output: str


class GraderCreate(BaseModel):
    type: str = Field(..., description="'text_similarity' or 'score_model'")
    name: str
    pass_threshold: float = Field(..., gt=0, description="Threshold between 0 and 1")
    evaluation_metric: str = Field(..., description="'fuzzy_match' or 'cosine'")


class GraderResponse(BaseModel):
    id: int
    type: str
    name: str
    pass_threshold: float
    evaluation_metric: str

    model_config = {"from_attributes": True}


class ResultResponse(BaseModel):
    id: int
    job_id: int
    grader_id: int
    score: float
    passed: bool
    created_at: datetime

    model_config = {"from_attributes": True}
