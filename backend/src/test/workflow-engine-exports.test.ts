import { MAX_PHASE_ATTEMPTS, MAX_TEST_ATTEMPTS } from '../engine/workflowEngine';



describe('workflowEngine constants', () => {

  it('exports attempt limits', () => {

    expect(MAX_TEST_ATTEMPTS).toBe(2);

    expect(MAX_PHASE_ATTEMPTS).toBe(2);

  });

});


