const { client } = require(`../../index`);

exports.addTeacher = async (_, { input }) => {
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`teachers`)
			.insertOne({ ...input });
		return res.insertedId;
	} catch (error) {
		throw new Error(error);
	}
};
