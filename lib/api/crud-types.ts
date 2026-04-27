export type CrudUpdateInput<TPayload, TIdField extends string = "id"> = {
  payload: TPayload;
} & Record<TIdField, string>;

export type CrudDeleteInput<TIdField extends string = "id"> = Record<
  TIdField,
  string
>;
