import { BoardPage } from './board-page.component';

type BoardRouteProps = {
  params: Promise<{ boardId: string }>;
};

export default async function BoardRoute({ params }: BoardRouteProps) {
  const { boardId } = await params;

  return <BoardPage boardId={boardId} />;
}
