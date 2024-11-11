from fastapi import HTTPException, status


def raise_not_found_exception(item: str = "Item"):
    """
    Raises a 404 Not Found exception with a default message.
    """
    message = f"{item} not found"
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=message
    )


def raise_bad_request_exception(detail: str = "Invalid request"):
    """
    Raises a 400 Bad Request exception with a custom message.
    """
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail
    )


def raise_unauthorized_exception(detail: str = "Unauthorized access"):
    """
    Raises a 401 Unauthorized exception with a custom message.
    """
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail
    )


def raise_generic_exception(detail: str = "An error occurred"):
    """
    Generic handler for unexpected exceptions
    """
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=detail
    )
