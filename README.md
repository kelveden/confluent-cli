confl
=====

Installation
------------
Pull down the source and run

```
npm install
npm link
```

Configuration
-------------
You'll need a `~/.confl/config` file of the following form:

```json
{
	"profiles": {
		"uat": {
			"apiUrl": "https://confluent-api-host:port",
			"schemaRegistry": "https://schema-registry-host:port",
 			"broker": "kafka-host:port",
			"username": "youruser",
			"password": "yourpassword"
		}
	},
	"defaultProfile": "uat"
}

```

Note that you'll also need the same 

Usage
-----
Run `confl --help` for a list of available commands and then `confl <command> --help` for more
help on a specific command.

E.g.

`confl stream losses-consumer-status-update-v3 -o beginning`