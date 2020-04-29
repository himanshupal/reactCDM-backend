const { client, Error } = require(`../../index`);

exports.updateStudent = async (_, { input }) => {
	if (!input._id)
		throw new Error(`Argument missing...`, {
			error: `You must provide a studentId as _id to update student details !!!`,
		});
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`students`)
			.updateOne(
				{
					_id: input._id,
				},
				{
					$set: {
						...input,
						lastUpdated: Date.now(),
					},
				}
			);
		return res.modifiedCount > 0
			? `Record updated !`
			: `No student found matching given _id...`;
	} catch (error) {
		throw new Error(error);
	}
};
