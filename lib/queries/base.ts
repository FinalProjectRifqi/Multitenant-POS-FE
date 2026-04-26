import {
  mutationOptions,
  queryOptions,
  type MutationKey,
  type QueryKey,
} from "@tanstack/react-query";
import type { ZodType } from "zod";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  type ApiRequestWithSchemaOptions,
} from "@/lib/api/client";

type UrlResolver<TVariables> = string | ((variables: TVariables) => string);

type QueryRequestConfig<TData, TParams> = Omit<
  ApiRequestWithSchemaOptions<TData, TParams>,
  "params" | "schema"
>;

type MutationRequestConfig<TData, TParams> = Omit<
  ApiRequestWithSchemaOptions<TData, TParams>,
  "schema"
>;

type BuildGetQueryOptionsInput<TData, TParams, TQueryKey extends QueryKey> = {
  queryKey: TQueryKey;
  url: string;
  params?: TParams;
  schema?: ZodType<TData>;
  requestConfig?: QueryRequestConfig<TData, TParams>;
};

type BuildMutationOptionsInput<
  TData,
  TVariables,
  TParams = Record<string, unknown>,
> = {
  mutationKey?: MutationKey;
  url: UrlResolver<TVariables>;
  schema?: ZodType<TData>;
  requestConfig?: MutationRequestConfig<TData, TParams>;
};

type DeleteVariables<TParams = Record<string, unknown>> = {
  params?: TParams;
};

function createMutationOptions<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  mutationKey?: MutationKey,
) {
  if (mutationKey) {
    return mutationOptions<TData, Error, TVariables, unknown>({
      mutationKey,
      mutationFn,
    });
  }

  return mutationOptions<TData, Error, TVariables, unknown>({
    mutationFn,
  });
}

function resolveUrl<TVariables>(
  url: UrlResolver<TVariables>,
  variables: TVariables,
): string {
  if (typeof url === "function") {
    return url(variables);
  }

  return url;
}

export function buildGetQueryOptions<
  TData,
  TParams = Record<string, unknown>,
  TQueryKey extends QueryKey = QueryKey,
>(input: BuildGetQueryOptionsInput<TData, TParams, TQueryKey>) {
  const { queryKey, url, params, schema, requestConfig } = input;

  return queryOptions({
    queryKey,
    queryFn: () =>
      apiGet<TData, TParams>(url, {
        ...requestConfig,
        params,
        schema,
      }),
  });
}

export function buildPostMutationOptions<
  TData,
  TVariables,
  TParams = Record<string, unknown>,
>(input: BuildMutationOptionsInput<TData, TVariables, TParams>) {
  const { mutationKey, url, schema, requestConfig } = input;

  return createMutationOptions(
    (variables: TVariables) =>
      apiPost<TData, TVariables, TParams>(
        resolveUrl(url, variables),
        variables,
        {
          ...requestConfig,
          schema,
        },
      ),
    mutationKey,
  );
}

export function buildPutMutationOptions<
  TData,
  TVariables,
  TParams = Record<string, unknown>,
>(input: BuildMutationOptionsInput<TData, TVariables, TParams>) {
  const { mutationKey, url, schema, requestConfig } = input;

  return createMutationOptions(
    (variables: TVariables) =>
      apiPut<TData, TVariables, TParams>(
        resolveUrl(url, variables),
        variables,
        {
          ...requestConfig,
          schema,
        },
      ),
    mutationKey,
  );
}

export function buildPatchMutationOptions<
  TData,
  TVariables,
  TParams = Record<string, unknown>,
>(input: BuildMutationOptionsInput<TData, TVariables, TParams>) {
  const { mutationKey, url, schema, requestConfig } = input;

  return createMutationOptions(
    (variables: TVariables) =>
      apiPatch<TData, TVariables, TParams>(
        resolveUrl(url, variables),
        variables,
        {
          ...requestConfig,
          schema,
        },
      ),
    mutationKey,
  );
}

export function buildDeleteMutationOptions<
  TData,
  TParams = Record<string, unknown>,
  TVariables extends DeleteVariables<TParams> = DeleteVariables<TParams>,
>(input: {
  mutationKey?: MutationKey;
  url: UrlResolver<TVariables>;
  schema?: ZodType<TData>;
  requestConfig?: QueryRequestConfig<TData, TParams>;
}) {
  const { mutationKey, url, schema, requestConfig } = input;

  return createMutationOptions(
    (variables: TVariables) =>
      apiDelete<TData, TParams>(resolveUrl(url, variables), {
        ...requestConfig,
        params: variables?.params,
        schema,
      }),
    mutationKey,
  );
}
