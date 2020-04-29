const { client, Error } = require(`../../index`);

exports.updateSubject = async (_, { input }) => {
	if (!input._id)
		throw new Error(`Argument missing...`, {
			error: `You must provide a subjectId as _id to update subject details !!!`,
		});
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`subjects`)
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
			? `Subject updated !`
			: `No subject found matching given _id...`;
	} catch (error) {
		throw new Error(error);
	}
};
