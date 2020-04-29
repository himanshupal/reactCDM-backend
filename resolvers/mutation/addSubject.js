const { client, Error } = require(`../../index`);

exports.addSubject = async (_, { input }) => {
	try {
		res = await (await client)
			.db(`RBMI`)
			.collection(`subjects`)
			.insertOne({ ...input });
		return res.insertedCount > 0
			? `Saved successfully`
			: `There was some error saving data, please try again or contact admin ! `;
	} catch (error) {
		throw new Error(error);
	}
};
