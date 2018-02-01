confluent-cli
=============

Installation
------------
```
npm install confluent-cli
```

Configuration
-------------
You'll need a `~/.confl/config` file of the following form:

```json
{
	"profiles": {
        "test": {
            "apiUrl": "https://confluent-api-host:port",
            "schemaRegistry": "https://schema-registry-host:port",
            "broker": "kafka-broker:port",
            "username": "kafka-username",
            "password": "kafka-password",
            "ssl": {
                "key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
                "cert": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
                "ca": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
            }
        }
	},
	"defaultProfile": "test"
}
```

Usage
-----
Run `confl --help` for a list of available commands and then `confl <command> --help` for more
help on a specific command.