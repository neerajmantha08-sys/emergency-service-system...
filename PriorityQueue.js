export class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  // Helper Index Calculators
  getParentIndex(i) { return Math.floor((i - 1) / 2); }
  getLeftChildIndex(i) { return 2 * i + 1; }
  getRightChildIndex(i) { return 2 * i + 2; }

  swap(i1, i2) {
    const temp = this.heap[i1];
    this.heap[i1] = this.heap[i2];
    this.heap[i2] = temp;
  }

  // Calculate composite priority score
  calculatePriorityScore(req) {
    const urgencyMap = { Critical: 400, High: 300, Medium: 200, Low: 100 };
    const typeMap = { Medical: 50, Fire: 40, Police: 30 };
    
    let baseScore = (urgencyMap[req.urgency] || 100) + (typeMap[req.type] || 0);
    // Age factor bonus: older requests get slight priority boost (aging prevention)
    const ageBonus = Math.min(20, Math.floor((Date.now() - new Date(req.timestamp).getTime()) / 60000));
    return baseScore + ageBonus;
  }

  enqueue(request) {
    const score = this.calculatePriorityScore(request);
    const node = { ...request, priorityScore: score };
    this.heap.push(node);
    this.heapifyUp();
    return node;
  }

  heapifyUp() {
    let index = this.heap.length - 1;
    while (
      index > 0 &&
      this.heap[index].priorityScore > this.heap[this.getParentIndex(index)].priorityScore
    ) {
      const parentIdx = this.getParentIndex(index);
      this.swap(index, parentIdx);
      index = parentIdx;
    }
  }

  dequeue() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const root = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown();
    return root;
  }

  heapifyDown() {
    let index = 0;
    while (this.getLeftChildIndex(index) < this.heap.length) {
      let largerChildIdx = this.getLeftChildIndex(index);
      const rightChildIdx = this.getRightChildIndex(index);

      if (
        rightChildIdx < this.heap.length &&
        this.heap[rightChildIdx].priorityScore > this.heap[largerChildIdx].priorityScore
      ) {
        largerChildIdx = rightChildIdx;
      }

      if (this.heap[index].priorityScore >= this.heap[largerChildIdx].priorityScore) {
        break;
      }

      this.swap(index, largerChildIdx);
      index = largerChildIdx;
    }
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  toArray() {
    return [...this.heap];
  }

  removeById(id) {
    const idx = this.heap.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    if (idx === this.heap.length - 1) {
      this.heap.pop();
    } else {
      this.heap[idx] = this.heap.pop();
      this.heapifyDown();
      this.heapifyUp();
    }
    return true;
  }

  isEmpty() {
    return this.heap.length === 0;
  }
}
