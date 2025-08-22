using System;

namespace Scaffold.Classes;

[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class InputTypeAttribute : Attribute
{
    public string InputType { get; }

    public InputTypeAttribute(string inputType)
    {
        // Validate the input type
        if (!IsValidInputType(inputType))
        {
            throw new ArgumentException($"Invalid input type. Must be one of: text, email, password, number, textarea.");
        }
        InputType = inputType;
    }

    private static bool IsValidInputType(string inputType)
    {
        return inputType is "text" or "email" or "password" or "number" or "textarea" or "dropdown";
    }
}
