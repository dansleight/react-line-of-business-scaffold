def to_camel_case(name: str) -> str:
    """
    Convert snake_case or PascalCase to camelCase.
    e.g., user_id -> userId, UserId -> userId
    """
    # Handle snake_case
    if "_" in name:
        words = name.split("_")
        return words[0].lower() + "".join(word.capitalize() for word in words[1:])
    
    # Handle PascalCase
    return name[0].lower() + name[1:] if name else name