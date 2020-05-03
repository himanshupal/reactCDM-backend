const { client, Error } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.updateSubject = async (_, { input }) => {
	user = CheckAuth(headers.authorization);
	if (
		user.access !==
		(`Director` || `Head of Department` || `Associate Professor`)
	)
		throw new Error(`Access Denied !!!`, {
			error: `You don't have enough permissions to perform this operation !!!`,
		});
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
						lastUpdatedBy: user.username,
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
