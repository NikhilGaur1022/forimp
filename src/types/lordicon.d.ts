
declare namespace JSX {
  interface IntrinsicElements {
    'lord-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      trigger?: string;
      colors?: string;
      stroke?: string;
      state?: string;
      target?: string;
      style?: React.CSSProperties | string;
    };
  }
}

