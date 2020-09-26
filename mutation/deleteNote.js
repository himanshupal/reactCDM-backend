const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { _id }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (access !== `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(dbName).collection(`notes`);

		const check = await node.findOne({ _id: ObjectId(_id) });
		if (check && check.createdBy !== loggedInUser)
			throw new UserInputError(`Access Denied ⚠`, {
				error: `You can only delete notes created by you.`,
			});

		const { deletedCount } = await node.deleteOne({ _id: ObjectId(_id) });

		if (!deletedCount)
			throw new UserInputError(`Unknown Error ⚠`, {
				error: `Error deleting note. Please try again or contact admin if issue persists.`,
			});

		return true;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
