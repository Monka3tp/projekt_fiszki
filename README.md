# Setting up and Running the Server with Ngrok Gateway


## 1. Running the server for Ngrok gateway
Install by:

```
npm install -g ngrok
```
or
```
npm install
```

Ensure that authentication is set up for your ngrok account by running:

```
ngrok authtoken YOUR_AUTH_TOKEN
```
To run the server for the Ngrok gateway, use the following command:

```
ngrok http 5000
```

## 2. Use provided run configurations
We've assembled run configurations for WebStorm to streamline the process of starting the server with Ngrok gateway. You can find these configurations in the `.run` directory of the project.\
These configurations are pre-set to help you quickly launch the server without manually entering commands each time and should be selected **as default**. If not check the instructions below.
### Click [here](./.run/README.md) for detailed instructions on how to use these configurations in your IDE.
