const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

const permitted = [`Assistant Professor`, `Associate Professor`, `Head of Department`, `Director`];

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

		const node = client.db(`RBMI`).collection(`notices`);
		const teacherNode = client.db(`RBMI`).collection(`teachers`);

		const check = await node.findOne({ _id: ObjectId(_id) });
		if (!check)
			throw new UserInputError(`Not Found ⚠`, {
				error: `Couldn't find the notice you are trying to delete. Please try again or contact admin if issue persists.`,
			});

		const creator = await teacherNode.findOne({ _id: ObjectId(check.createdBy) });
		const editor = await teacherNode.findOne({ _id: ObjectId(loggedInUser) });

		if (permitted.indexOf(editor.designation) < permitted.indexOf(creator.designation))
			throw new UserInputError(`Access Denied ⚠`, {
				error: `You can only delete notices created by you or someone with lower authority than yours.`,
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
