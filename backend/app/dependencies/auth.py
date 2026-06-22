from fastapi import Header, HTTPException
from jose import JWTError, jwt
import os

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"

async def get_current_user(
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Token missing"
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if not payload.get("email") or payload.get("role") not in {"student", "teacher", "admin"}:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return payload

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
