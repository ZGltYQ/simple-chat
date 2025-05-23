import React from "react";
import Slide from '@mui/material/Slide';
import { TransitionProps } from "@mui/material/transitions";

export default React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  })