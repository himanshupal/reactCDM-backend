const { client, Error } = require(`../../index`);

exports.addTeacher = async (_, { input }) => {
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`teachers`)
			.insertOne({ ...input, createdAt: Date.now() });
		return res.insertedCount > 0
			? `Saved successfully`
			: `There was some error saving data, please try again or contact admin ! `;
	} catch (error) {
		if (error.code === 11000)
			throw new Error(`Duplicate key Error !!!`, {
				error: `${error.keyValue._id} already exists in database, can't replace !`,
			});
		throw new Error(error);
	}
};
