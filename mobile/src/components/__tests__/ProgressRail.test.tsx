import React from 'react';

import renderer from 'react-test-renderer';

import { ProgressRail } from '../ProgressRail';



describe('ProgressRail', () => {

  it('renders three segments', () => {

    const tree = renderer.create(<ProgressRail done={2} running={1} todo={3} />).toJSON();

    expect(tree).toBeTruthy();

  });

});


