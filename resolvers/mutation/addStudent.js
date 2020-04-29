const { client, Error } = require(`../../index`);

exports.addStudent = async (_, { input }) => {
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`students`)
			.insertOne({
				...input,
				registeredOn: Date.now(),
			});
		return res.insertedCount > 0
			? `Saved successfully`
			: `There was some error saving data, please try again or contact admin ! `;
	} catch (error) {
		throw new Error(error);
	}
};
