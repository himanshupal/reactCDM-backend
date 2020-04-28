const { client } = require(`../../index`);

exports.addClass = async (_, { input }) => {
	try {
		res = await (await client)
			.db(`RBMI`)
			.collection(`classes`)
			.insertOne({ ...input });
		return res.insertedId;
	} catch (error) {
		throw new Error(error);
	}
};
