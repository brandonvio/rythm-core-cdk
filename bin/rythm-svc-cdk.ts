#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { RythmSvcCdkStack } from "../lib/_rythm-svc-cdk-stack";

const app = new cdk.App();
new RythmSvcCdkStack(app, "RythmSvcCdkStack", {
  stackName: "rythm-svc-stack",
  env: {
    account: "778477161868",
    region: "us-west-2",
  },
});
