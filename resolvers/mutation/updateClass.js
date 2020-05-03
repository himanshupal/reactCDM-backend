const { client, Error } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.updateClass = async (_, { input }) => {
	user = CheckAuth(headers.authorization);
	if (
		user.access !==
		(`Director` || `Head of Department` || `Associate Professor`)
	)
		throw new Error(`Access Denied !!!`, {
			error: `You don't have enough permissions to perform this operation !!!`,
		});
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
						lastUpdatedBy: user.username,
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
