const avro = require('avsc');
const R = require('ramda');
const request = require('request-promise-native');

const getSchema = (schemaId, { schemaRegistry, username, password }) => {
    return request.get(schemaRegistry + "/schemas/ids/" + schemaId, {
        auth: {
            username: username,
            password: password
        }
    }).then(R.pipe(
        JSON.parse,
        R.prop("schema"),
        JSON.parse,
        avro.Type.forSchema)
    );
};

module.exports.deserialize = (messageBytes, schemaRegistryConfig) => {
    if (messageBytes[ 0 ] !== 0x0) {
        throw new Error("Magic byte not found.");
    }

    const schemaId = messageBytes.slice(1).readInt32BE();
    const body = messageBytes.slice(5);

    return getSchema(schemaId, schemaRegistryConfig)
        .then((schema) => schema.fromBuffer(body));
};