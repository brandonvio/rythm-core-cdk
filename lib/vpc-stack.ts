import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ssm from "@aws-cdk/aws-ssm";

interface VpcStackProps extends cdk.StackProps {
  keyName: string;
}

export class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: cdk.Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    this.vpc = new ec2.Vpc(this, "RythmVpc", {
      maxAzs: 2,
      cidr: "10.0.0.0/24",

      enableDnsHostnames: true,
      enableDnsSupport: true,
      gatewayEndpoints: {
        S3: {
          service: ec2.GatewayVpcEndpointAwsService.S3,
        },
      },
      natGatewayProvider: ec2.NatProvider.instance({
        instanceType: new ec2.InstanceType("t2.micro"),
        machineImage: new ec2.NatInstanceImage(),
        keyName: props.keyName,
      }),
      natGateways: 1,
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: "PUBLIC",
          cidrMask: 27,
        },
        {
          cidrMask: 27,
          name: "PRIVATE",
          subnetType: ec2.SubnetType.PRIVATE,
        },
        {
          cidrMask: 27,
          name: "ISOLATED",
          subnetType: ec2.SubnetType.ISOLATED,
        },
      ],
    });

    new ssm.StringParameter(this, "RythmVpcidParameter", {
      parameterName: "rythm-vpcid",
      stringValue: this.vpc.vpcId,
    });
  }
}
