const { client, Error } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.getGist = async (_, { input }, { headers }) => {
	try {
		return await (await client).db(`RBMI`).collection(`gists`).find().toArray();
	} catch (error) {
		throw new Error(error);
	}
};
