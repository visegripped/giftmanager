declare module 'react-facebook-login' {
  import { Component } from 'react';

  export interface ReactFacebookLoginProps {
    appId: string;
    autoLoad?: boolean;
    fields?: string;
    callback: (
      response: ReactFacebookLoginInfo | ReactFacebookLoginFailure
    ) => void;
    onFailure?: (error: Error) => void;
    scope?: string;
    returnScopes?: boolean;
    xfbml?: boolean;
    version?: string;
    language?: string;
    cssClass?: string;
    textButton?: string;
    typeButton?: string;
    icon?: string;
    size?: string;
    buttonStyle?: React.CSSProperties;
    containerStyle?: React.CSSProperties;
    cookie?: boolean;
    authType?: string;
    responseType?: string;
    redirectUri?: string;
    state?: string;
    isDisabled?: boolean;
    isMobile?: boolean;
    disableMobileRedirect?: boolean;
    reAuthenticate?: boolean;
    render?: (renderProps: {
      onClick: () => void;
      isDisabled: boolean;
      isProcessing: boolean;
      isSdkLoaded: boolean;
    }) => React.ReactNode;
  }

  export interface ReactFacebookLoginInfo {
    accessToken: string;
    expiresIn?: number;
    reauthorize_required_in?: number;
    signedRequest?: string;
    userID: string;
  }

  export interface ReactFacebookLoginFailure {
    status?: string;
    [key: string]: any;
  }

  export default class ReactFacebookLogin extends Component<ReactFacebookLoginProps> {}
}
