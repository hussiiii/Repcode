import { ownedProblem, withUser } from '../../lib/server/api';
import { idSchema } from '../../lib/server/validation';

export default withUser('GET', async (req, res) => {
  const problem = await ownedProblem(idSchema.parse(req.query.problemId), req.appUser.id);
  return res.status(200).json(problem);
});
