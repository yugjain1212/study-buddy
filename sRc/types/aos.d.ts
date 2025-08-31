declare module 'aos' {
  type AosEasing =
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'ease-in-back'
    | 'ease-out-back'
    | 'ease-in-out-back'
    | 'ease-in-sine'
    | 'ease-out-sine'
    | 'ease-in-out-sine'
    | 'ease-in-quad'
    | 'ease-out-quad'
    | 'ease-in-out-quad'
    | 'ease-in-cubic'
    | 'ease-out-cubic'
    | 'ease-in-out-cubic'
    | 'ease-in-quart'
    | 'ease-out-quart'
    | 'ease-in-out-quart';

  type AosAnchorPlacement =
    | 'top-bottom'
    | 'top-center'
    | 'top-top'
    | 'center-bottom'
    | 'center-center'
    | 'center-top'
    | 'bottom-bottom'
    | 'bottom-center'
    | 'bottom-top';

  interface AosOptions {
    offset?: number;
    delay?: number;
    duration?: number;
    easing?: AosEasing;
    once?: boolean;
    mirror?: boolean;
    anchorPlacement?: AosAnchorPlacement;
    disable?: boolean | 'phone' | 'tablet' | 'mobile' | string | (() => boolean);
    startEvent?: string;
    initClassName?: string;
    animatedClassName?: string;
    useClassNames?: boolean;
    disableMutationObserver?: boolean;
    debounceDelay?: number;
    throttleDelay?: number;
    disableMutationObserverOnInit?: boolean;
  }

  interface AosEventTarget extends EventTarget {
    nodeName: string;
    getAttribute(qualifiedName: string): string | null;
  }

  interface AosEvent extends CustomEvent {
    detail: {
      currentTarget: AosEventTarget;
    };
  }

  interface Aos {
    init(options?: AosOptions): void;
    refresh(): void;
    refreshHard(): void;
    on(event: 'aos:in', callback: (event: AosEvent) => void): void;
    on(event: 'aos:out', callback: (event: AosEvent) => void): void;
    on(event: string, callback: (event: AosEvent) => void): void;
    off(event: string, callback?: (event: AosEvent) => void): void;
  }

  const AOS: Aos;
  export default AOS;
}
