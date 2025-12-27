/**
 * Game Logic Service
 * @description Handles game logic: win detection, move validation, board state
 */

export interface BoardCell {
  x: number;
  y: number;
  playerId: string | null;
  symbol: 'X' | 'O' | null;
}

export class GameLogicService {
  /**
   * Kiểm tra xem có thắng không (5 nước liên tiếp)
   * @param board - Mảng 2D đại diện cho bàn cờ (null = ô trống, 'X' hoặc 'O' = đã đánh)
   * @param x - Tọa độ x của nước vừa đánh
   * @param y - Tọa độ y của nước vừa đánh
   * @param symbol - Ký hiệu của người chơi ('X' hoặc 'O')
   * @param boardSize - Kích thước bàn cờ
   * @returns true nếu thắng, false nếu chưa thắng
   */
  checkWin(
    board: (string | null)[][],
    x: number,
    y: number,
    symbol: 'X' | 'O',
    boardSize: number
  ): boolean {
    const directions = [
      [0, 1],   // Ngang (→)
      [1, 0],   // Dọc (↓)
      [1, 1],   // Chéo chính (↘)
      [1, -1],  // Chéo phụ (↙)
    ];

    for (const [dx, dy] of directions) {
      let count = 1; // Đếm nước vừa đánh

      // Đếm về một phía
      count += this.countConsecutive(board, x, y, dx, dy, symbol, boardSize);
      // Đếm về phía ngược lại
      count += this.countConsecutive(board, x, y, -dx, -dy, symbol, boardSize);

      if (count >= 5) {
        return true;
      }
    }

    return false;
  }

  /**
   * Đếm số nước liên tiếp theo một hướng
   */
  private countConsecutive(
    board: (string | null)[][],
    x: number,
    y: number,
    dx: number,
    dy: number,
    symbol: 'X' | 'O',
    boardSize: number
  ): number {
    let count = 0;
    let newX = x + dx;
    let newY = y + dy;

    while (
      newX >= 0 &&
      newX < boardSize &&
      newY >= 0 &&
      newY < boardSize &&
      board[newX]?.[newY] === symbol
    ) {
      count++;
      newX += dx;
      newY += dy;
    }

    return count;
  }

  /**
   * Kiểm tra xem nước đi có hợp lệ không
   * @param board - Bàn cờ hiện tại
   * @param x - Tọa độ x
   * @param y - Tọa độ y
   * @param boardSize - Kích thước bàn cờ
   * @returns true nếu hợp lệ, false nếu không hợp lệ
   */
  isValidMove(
    board: (string | null)[][],
    x: number,
    y: number,
    boardSize: number
  ): boolean {
    // Kiểm tra tọa độ có trong phạm vi bàn cờ không
    if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
      return false;
    }

    // Kiểm tra ô đã được đánh chưa
    if (board[x]?.[y] !== null && board[x]?.[y] !== undefined) {
      return false;
    }

    return true;
  }

  /**
   * Khởi tạo bàn cờ rỗng
   * @param boardSize - Kích thước bàn cờ
   * @returns Bàn cờ rỗng (mảng 2D với tất cả giá trị null)
   */
  initializeBoard(boardSize: number): (string | null)[][] {
    return Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(null));
  }

  /**
   * Tạo bàn cờ từ lịch sử các nước đi (để replay)
   * @param history - Lịch sử các nước đi
   * @param boardSize - Kích thước bàn cờ
   * @param players - Danh sách người chơi (để map playerId -> symbol)
   * @returns Bàn cờ sau khi replay các nước đi
   */
  replayBoard(
    history: Array<{ x: number; y: number; playerId: string }>,
    boardSize: number,
    players: Array<{ userId: string; symbol: 'X' | 'O' }>
  ): (string | null)[][] {
    const board = this.initializeBoard(boardSize);
    const playerSymbolMap = new Map<string, 'X' | 'O'>();

    // Tạo map playerId -> symbol
    players.forEach((player) => {
      playerSymbolMap.set(player.userId.toString(), player.symbol);
    });

    // Replay từng nước đi
    history.forEach((move) => {
      const symbol = playerSymbolMap.get(move.playerId.toString());
      if (symbol && this.isValidMove(board, move.x, move.y, boardSize)) {
        board[move.x][move.y] = symbol;
      }
    });

    return board;
  }

  /**
   * Kiểm tra xem bàn cờ đã đầy chưa (hòa)
   * @param board - Bàn cờ hiện tại
   * @returns true nếu bàn cờ đã đầy, false nếu còn chỗ
   */
  isBoardFull(board: (string | null)[][]): boolean {
    return board.every((row) => row.every((cell) => cell !== null));
  }
}

export const gameLogicService = new GameLogicService();

