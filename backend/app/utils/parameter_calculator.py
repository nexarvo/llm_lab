from typing import List, Tuple
import numpy as np

def calculate_temperature_array(base_temperature: float, step: int) -> List[float]:
    """
    Calculate an array of temperature values based on the base temperature and step count.
    
    Args:
        base_temperature: The base temperature value
        step: Number of steps to generate
        
    Returns:
        List of temperature values
    """
    if step == 1:
        return [base_temperature]
    
    # Create a range of temperatures around the base value
    # For step > 1, we'll create a logarithmic distribution
    min_temp = max(0.0, base_temperature * 0.1)
    max_temp = min(2.0, base_temperature * 2.0)
    
    if step == 2:
        return [min_temp, max_temp]
    
    # Create logarithmic spacing for more variation
    temperatures = np.logspace(
        np.log10(min_temp + 0.01),  # Add small value to avoid log(0)
        np.log10(max_temp),
        step
    ).tolist()
    
    # Ensure we include the base temperature if it's not already in the list
    if base_temperature not in temperatures:
        temperatures.append(base_temperature)
        temperatures.sort()
    
    # Round to 2 decimal places for consistency
    return [round(temp, 2) for temp in temperatures]

def calculate_top_p_array(base_top_p: float, step: int) -> List[float]:
    """
    Calculate an array of top_p values based on the base top_p and step count.
    
    Args:
        base_top_p: The base top_p value
        step: Number of steps to generate
        
    Returns:
        List of top_p values
    """
    if step == 1:
        return [base_top_p]
    
    # Create a range of top_p values around the base value
    min_top_p = max(0.0, base_top_p * 0.1)
    max_top_p = min(1.0, base_top_p * 1.5)
    
    if step == 2:
        return [min_top_p, max_top_p]
    
    # Create linear spacing for top_p values
    top_p_values = np.linspace(min_top_p, max_top_p, step).tolist()
    
    # Ensure we include the base top_p if it's not already in the list
    if base_top_p not in top_p_values:
        top_p_values.append(base_top_p)
        top_p_values.sort()
    
    # Round to 2 decimal places for consistency
    return [round(top_p, 2) for top_p in top_p_values]

def generate_parameter_combinations(
    temperatures: List[float], 
    top_p_values: List[float]
) -> List[Tuple[float, float]]:
    """
    Generate all possible combinations of temperature and top_p values.
    
    Args:
        temperatures: List of temperature values
        top_p_values: List of top_p values
        
    Returns:
        List of tuples containing (temperature, top_p) combinations
    """
    combinations = []
    for temp in temperatures:
        for top_p in top_p_values:
            combinations.append((temp, top_p))
    
    return combinations

def calculate_parameter_variations(
    base_temperature: float, 
    base_top_p: float, 
    step: int
) -> List[Tuple[float, float]]:
    """
    Calculate all parameter variations for a given base temperature and top_p.
    
    Args:
        base_temperature: The base temperature value
        base_top_p: The base top_p value
        step: Number of steps to generate
        
    Returns:
        List of tuples containing (temperature, top_p) combinations
    """
    temperatures = calculate_temperature_array(base_temperature, step)
    top_p_values = calculate_top_p_array(base_top_p, step)
    
    return generate_parameter_combinations(temperatures, top_p_values)
