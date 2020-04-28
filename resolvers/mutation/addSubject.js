const { client } = require(`../../index`);

exports.addSubject = async (_, { input }) => {
	try {
		res = await (await client)
			.db(`RBMI`)
			.collection(`subjects`)
			.insertOne({ ...input });
		return res.insertedId;
	} catch (error) {
		throw new Error(error);
	}
};
