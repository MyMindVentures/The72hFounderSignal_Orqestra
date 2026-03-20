import React from 'react';

import { render, fireEvent } from '@testing-library/react-native';

import { SegmentedTabs } from '../SegmentedTabs';



describe('SegmentedTabs', () => {

  it('calls onChange when tab pressed', () => {

    const onChange = jest.fn();

    const { getByText } = render(

      <SegmentedTabs<'a' | 'b'>

        tabs={[

          { key: 'a', label: 'Tab A' },

          { key: 'b', label: 'Tab B' }

        ]}

        activeKey="a"

        onChange={onChange}

      />

    );

    fireEvent.press(getByText('Tab B'));

    expect(onChange).toHaveBeenCalledWith('b');

  });

});


