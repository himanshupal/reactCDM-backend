const { client, Error } = require(`../../index`);

exports.updateClass = async (_, { input }) => {
	if (!input._id)
		throw new Error(`Arguments missing...`, {
			error: `You must provide a class & batch as _id to update class details !!!`,
		});
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`classes`)
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
			? `Class updated !`
			: `No class found matching given name...`;
	} catch (error) {
		throw new Error(error);
	}
};
