declare module "mutexify" {
  type Lock = (fn: Release) => number;
  type Release = (cb: Function, err: any, value: any) => void
  function mutexify(): Lock;
  export = mutexify;
}
