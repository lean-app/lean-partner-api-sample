import { useEffect, EffectCallback } from "react";

export const useDidMount = (cb: EffectCallback) => useEffect(cb, []);