# Credentials

Backend credentials are stored in AWS Parameter Store, aka SSM or Simple Systems Manager. Please
ensure the following credendials are stored:

```bash
$ aws ssm put-parameter --name auth0ClientId --type String --value '«Your Auth0 Client ID»'
{ "Version": 1 }
$ aws ssm put-parameter --name auth0ClientSecret --type String --value '«Your Auth0 Client Secret»'
{ "Version": 1 }
$ aws ssm put-parameter --name auth0PublicKey --type String --value "$(<auth0_public_key.pem)"
{ "Version": 1 }
```
