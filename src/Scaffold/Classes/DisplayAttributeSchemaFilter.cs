using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace Scaffold.Classes;

public class DisplayAttributeSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type == null) return;

        // Iterate over the properties of the type
        foreach (var property in context.Type.GetProperties())
        {
            var displayAttribute = property.GetCustomAttribute<DisplayAttribute>();
            if (displayAttribute != null)
            {
                // Get the schema property corresponding to the model property
                if (schema.Properties.TryGetValue(property.Name.ToLowerInvariant(), out var schemaProperty))
                {
                    // Set the 'title' to the Display Name
                    if (!string.IsNullOrEmpty(displayAttribute.Name))
                    {
                        schemaProperty.Title = displayAttribute.Name;
                    }

                    // Set the 'description' to the Display Prompt (or Name if Prompt is not set)
                    if (!string.IsNullOrEmpty(displayAttribute.Description))
                    {
                        schemaProperty.Description = displayAttribute.Description;
                    }
                    else if (!string.IsNullOrEmpty(displayAttribute.Name))
                    {
                        schemaProperty.Description = displayAttribute.Name;
                    }
                }
            }

            // Handle InputType attribute
            var inputTypeAttribute = property.GetCustomAttribute<InputTypeAttribute>();
            if (inputTypeAttribute != null)
            {
                if (schema.Properties.TryGetValue(property.Name.ToLowerInvariant(), out var schemaProperty))
                {
                    // Add custom extension for input type
                    schemaProperty.Extensions.Add("x-input-type", new OpenApiString(inputTypeAttribute.InputType));

                    // Optionally map to standard OpenAPI formats for known types
                    if (inputTypeAttribute.InputType == "email")
                    {
                        schemaProperty.Format = "email";
                    }
                    else if (inputTypeAttribute.InputType == "password")
                    {
                        schemaProperty.Format = "password";
                    }
                    else if (inputTypeAttribute.InputType == "number")
                    {
                        schemaProperty.Type = "number"; // Ensure the type is number if applicable
                    }
                    // For 'textarea', we rely on the x-input-type extension
                }
            }
        }
    }
}