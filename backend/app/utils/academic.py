def calculate_academic_year(admission_year: int, current_year: int, current_month: int) -> str:
    """Calculate academic year based on admission year."""
    # Academic year usually starts in July
    years_passed = current_year - admission_year
    if current_month >= 7:
        academic_year = years_passed + 1
    else:
        academic_year = years_passed
        
    if academic_year > 4:
        return 'alumni'
    return str(max(1, academic_year))
