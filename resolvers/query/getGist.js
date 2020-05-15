const { client, Error, ObjectId } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.getGist = async (_, { id }, { headers }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin !`,
		});
	}

	if (!headers.authorization)
		return await connection
			.db(`RBMI`)
			.collection(`gists`)
			.find({ scope: `public` })
			.toArray();

	if (id)
		return await connection
			.db(`RBMI`)
			.collection(`gists`)
			.find({ _id: ObjectId(id) })
			.toArray();

	user = CheckAuth(headers.authorization);

	privateGists = await connection
		.db(`RBMI`)
		.collection(`gists`)
		.find({
			createdBy: user.username,
			scope: `private`,
		})
		.toArray();
	publicGists = await connection
		.db(`RBMI`)
		.collection(`gists`)
		.find({ scope: `public` })
		.toArray();
	return [...privateGists, `x`, ...publicGists];
};
