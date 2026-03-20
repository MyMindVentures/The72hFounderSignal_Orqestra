import React from 'react';

import renderer from 'react-test-renderer';

import { StatusChip } from '../StatusChip';



describe('StatusChip', () => {

  it('renders label', () => {

    const tree = renderer.create(<StatusChip label="running" />).toJSON();

    expect(tree).toBeTruthy();

  });



  it('renders active variant', () => {

    const tree = renderer.create(<StatusChip label="ok" variant="active" />).toJSON();

    expect(tree).toBeTruthy();

  });

});


