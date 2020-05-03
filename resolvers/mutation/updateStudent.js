const { client, Error } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.updateStudent = async (_, { input }) => {
	user = CheckAuth(headers.authorization);
	if (
		user.access !==
		(`Head of Department` || `Assistant Professor` || `Associate Professor`)
	)
		throw new Error(`Access Denied !!!`, {
			error: `You don't have enough permissions to perform this operation !!!`,
		});
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
						lastUpdatedBy: user.username,
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
