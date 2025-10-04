import React from "react";
import Fade from '@mui/material/Fade';
import { TransitionProps } from "@mui/material/transitions";

export default React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Fade ref={ref} {...props} timeout={200} />;
  })