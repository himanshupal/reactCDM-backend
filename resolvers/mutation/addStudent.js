const { client } = require(`../../index`);

exports.addStudent = async (_, { input }) => {
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`students`)
			.insertOne({
				...input,
				registeredOn: Date.now(),
			});
		return res.insertedId;
	} catch (error) {
		throw new Error(error);
	}
};
