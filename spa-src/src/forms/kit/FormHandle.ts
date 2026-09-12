export type FormHandle = {
  submit: () => Promise<boolean>;
  reset: () => void;
  isDirty: () => boolean;
};
