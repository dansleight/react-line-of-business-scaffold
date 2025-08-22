import { z } from 'zod';

export interface PropDef {
  property: string;
  type: string;
  title: string;
  placeholder?: string;
  fieldType: "text" | "textarea" | "email" | "number";
}

export const AddWidgetModelSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name max length is 100"),
  description: z.string(),
});

export enum AddWidgetModelProps {
  name,
  description,
};

export const AddWidgetModelPropDefs: PropDef[] = [{"property": "name", "type": "string", "title": "Name", "placeholder": "Name", "fieldType": "text" },{"property": "description", "type": "string", "title": "Widget Description", "placeholder": "Widget Description", "fieldType": "textarea" }]

