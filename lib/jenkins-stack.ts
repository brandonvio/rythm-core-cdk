import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as iam from "@aws-cdk/aws-iam";

var path = require("path");

export interface JenkinsStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

/**
 * https://serverfault.com/questions/558631/unable-to-access-jenkins-server
 */
export class JenkinsStack extends cdk.Stack {
  public readonly jenkinsInstance: ec2.Instance;

  constructor(scope: cdk.Construct, id: string, props: JenkinsStackProps) {
    super(scope, id, props);

    const jenkinsRole = new iam.Role(this, "JenkinsInstanceRole", {
      roleName: "jenkins-instance-role",
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    jenkinsRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["*"],
        effect: iam.Effect.ALLOW,
      })
    );

    const jenkinsInstanceSG = new ec2.SecurityGroup(this, "JenkinsInstanceSG", {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: "Jenkins Instance security group",
    });

    jenkinsInstanceSG.addIngressRule(ec2.Peer.ipv4("10.0.0.0/24"), ec2.Port.tcp(22));
    jenkinsInstanceSG.addIngressRule(ec2.Peer.ipv4("10.0.0.0/24"), ec2.Port.tcp(8080));

    this.jenkinsInstance = new ec2.Instance(this, "JenkinsInstance", {
      role: jenkinsRole,
      vpc: props.vpc,
      instanceType: new ec2.InstanceType("t3a.small"),
      machineImage: new ec2.GenericLinuxImage({
        "us-west-2": "ami-07dd19a7900a1f049",
      }),
      vpcSubnets: props.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE }),
      keyName: "rythm-key-pair",
      securityGroup: jenkinsInstanceSG,
    });

    this.jenkinsInstance.userData.addCommands(
      "sudo apt-get update",
      "sudo apt-get install openjdk-8-jdk -y",
      "java -version",
      "wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -",
      'sudo apt-add-repository "deb https://pkg.jenkins.io/debian-stable binary/"',
      "sudo apt-get install jenkins -y",
      "sudo systemctl start jenkins",
      "sudo systemctl status jenkins",
      "sudo /etc/init.d/jenkins restart",
      "curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -",
      "sudo apt-get install -y nodejs",
      "node --version",
      "sudo apt install unzip -y",
      'curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"',
      "unzip awscliv2.zip",
      "sudo ./aws/install -i /usr/local/aws-cli -b /usr/local/bin",
      "aws --version",
      "sudo npm install -g aws-cdk",
      "cdk --version",
      "sudo npm install -g typescript",
      "tsc --version",
      "sudo npm install -g gatsby-cli install -g",
      "gatsby --version",
      'read -t 30 -p "I am going to wait for 5 seconds only ..."',
      "sudo cat /var/lib/jenkins/secrets/initialAdminPassword",
      "sudo /etc/init.d/jenkins restart"
    );
  }
}
