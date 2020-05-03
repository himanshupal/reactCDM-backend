const { client, Error } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.getGist = async (_, { _id }, { headers }) => {
	privateGists = [];
	if (_id) {
		try {
			return await (await client)
				.db(`RBMI`)
				.collection(`gists`)
				.find({ _id })
				.toArray();
		} catch (error) {
			throw new Error(error);
		}
	}

	if (headers.authorization) {
		const user = CheckAuth(headers.authorization);
		privateGists = await findGist(user.username);
	}

	try {
		publicGists = await (await client)
			.db(`RBMI`)
			.collection(`gists`)
			.find({ scope: { $ne: `private` } })
			.toArray();
		return [...privateGists, ...publicGists];
	} catch (error) {
		throw new Error(error);
	}
};

const findGist = async (username) => {
	try {
		return await (await client)
			.db(`RBMI`)
			.collection(`gists`)
			.find({
				creator: username,
				scope: `private`,
				// scope: { $or: [`private`, `class`, `department`] },
			})
			.toArray();
	} catch (error) {
		throw new Error(`No gists created yet...`);
	}
};
