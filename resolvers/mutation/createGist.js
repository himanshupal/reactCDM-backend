const { client, Error } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.createGist = async (_, { input }) => {
	user = CheckAuth(headers.authorization);
	if (!user)
		throw new Error(`Access Denied !!!`, {
			error: `You don't have enough permissions to perform this operation !!!`,
		});
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`gists`)
			.insertOne({
				...input,
				_id: `${input.creator} ${Date.now()}`,
				createdAt: Date.now(),
				createdBy: user.username,
			});
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
